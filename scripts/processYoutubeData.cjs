#!/usr/bin/env node
/*
 * YouTube 제품별 정량 집계 스크립트 (오프라인)
 * 입력: data/raw/dataset_youtube-scraper_*.json (최신 파일 1개 자동 선택)
 * 매핑: data/mappings/products.json (18개 제품)
 * 출력: data/processed/youtube_products.json, data/raw/generated/youtube_products.csv
 */

const fs = require('fs');
const path = require('path');

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/
const CONFIG_PATH = path.join(process.cwd(), 'config', 'latest-month.json')

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, item) => {
    if (!item.startsWith('--')) return acc
    const [rawKey, rawValue] = item.replace(/^--/, '').split('=')
    const key = rawKey.trim()
    const value = rawValue === undefined ? true : rawValue.trim()
    acc[key] = value
    return acc
  }, {})
}

function readLatestMonth() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null
    const content = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
    if (MONTH_REGEX.test(content?.month)) {
      return content.month
    }
  } catch (error) {
    console.warn('[YouTubeData] latest-month.json 읽기 실패:', error.message)
  }
  return null
}

function resolveMonth(requested) {
  if (!requested) return null
  if (!MONTH_REGEX.test(requested)) {
    throw new Error(`잘못된 월 형식입니다: ${requested}. YYYY-MM 형식을 사용하세요.`)
  }
  return requested
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function findLatestScraperJson(rawDir) {
  const files = fs.readdirSync(rawDir)
    .filter((f) => f.startsWith('dataset_youtube-scraper_') && f.endsWith('.json'))
    .sort();
  if (files.length === 0) {
    throw new Error('dataset_youtube-scraper_*.json 파일을 data/raw 에서 찾을 수 없습니다.');
  }
  return path.join(rawDir, files[files.length - 1]);
}

function toNumber(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return n;
}

function quantile(values, q) {
  if (!values.length) return 0;
  const arr = values.slice().sort((a, b) => a - b);
  const pos = (arr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if ((arr[base + 1] !== undefined)) {
    return arr[base] + rest * (arr[base + 1] - arr[base]);
  } else {
    return arr[base];
  }
}

function main() {
  const root = process.cwd()
  const args = parseArgs(process.argv)
  const month = resolveMonth(args.month) || readLatestMonth()

  if (!month) {
    throw new Error('월 정보를 찾을 수 없습니다. --month=YYYY-MM 형식으로 실행해 주세요.')
  }

  console.log(`📅 대상 월: ${month}`)

  const rawDir = path.join(root, 'data', 'raw', month)
  if (!fs.existsSync(rawDir)) {
    throw new Error(`원본 데이터 폴더가 존재하지 않습니다: ${rawDir}`)
  }

  const processedDir = path.join(root, 'data', 'processed', month)
  const rawGeneratedDir = path.join(root, 'data', 'raw', 'generated', month)
  const ytDir = path.join(root, 'data', 'processed', 'youtube', month)

  fs.mkdirSync(processedDir, { recursive: true })
  fs.mkdirSync(rawGeneratedDir, { recursive: true })
  fs.mkdirSync(ytDir, { recursive: true })

  const productsMapping = readJSON(path.join(root, 'data', 'mappings', 'products.json'));
  const productKeys = Object.keys(productsMapping.products);

  const scraperFile = findLatestScraperJson(rawDir);
  const raw = readJSON(scraperFile);

  // 집계 준비
  const byProduct = new Map();
  for (const p of productKeys) {
    const info = productsMapping.products[p];
    byProduct.set(p, {
      product: p,
      brand: info.brand,
      category: info.category,
      videos: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shorts: 0,
      _viewsArray: [],
    });
  }

  for (const row of raw) {
    const product = (row.input || '').trim();
    if (!byProduct.has(product)) continue; // 매핑된 18개만 카운트
    const item = byProduct.get(product);

    const views = toNumber(row.viewCount);
    const likes = toNumber(row.likes);
    const comments = toNumber(row.commentsCount);
    const isShorts = (row.type === 'shorts') || (String(row.url || '').includes('/shorts/'));

    item.videos += 1;
    item.views += views;
    item.likes += likes;
    item.comments += comments;
    item.shorts += isShorts ? 1 : 0;
    item._viewsArray.push(views);
  }

  // 전체 합계
  let totalVideos = 0;
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  for (const v of byProduct.values()) {
    totalVideos += v.videos;
    totalViews += v.views;
    totalLikes += v.likes;
    totalComments += v.comments;
  }

  const rows = [];
  for (const v of byProduct.values()) {
    const avgViews = v.videos ? v.views / v.videos : 0;
    const avgLikes = v.videos ? v.likes / v.videos : 0;
    const avgComments = v.videos ? v.comments / v.videos : 0;
    const er = v.views ? (v.likes + v.comments) / v.views : 0; // 참여율
    const shortsRatio = v.videos ? v.shorts / v.videos : 0;
    const medianViews = quantile(v._viewsArray, 0.5);
    const p90Views = quantile(v._viewsArray, 0.9);
    const sovPosts = totalVideos ? v.videos / totalVideos : 0;
    const sovViews = totalViews ? v.views / totalViews : 0;

    rows.push({
      product: v.product,
      brand: v.brand,
      category: v.category,
      videos: v.videos,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      views_avg: avgViews,
      likes_avg: avgLikes,
      comments_avg: avgComments,
      engagement_rate: er,
      shorts_ratio: shortsRatio,
      views_median: medianViews,
      views_p90: p90Views,
      sov_posts: sovPosts,
      sov_views: sovViews,
    });
  }

  // 정렬: 조회수 내림차순
  rows.sort((a, b) => b.views - a.views);

  const output = {
    meta: {
      source: path.relative(root, scraperFile),
      products: rows.length,
      totals: {
        videos: totalVideos,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
      },
      processedAt: new Date().toISOString(),
    },
    rows,
  };

  // 저장(JSON)
  const outJson = path.join(processedDir, 'youtube_products.json');
  fs.writeFileSync(outJson, JSON.stringify(output, null, 2), 'utf8');

  // 저장(CSV)
  const outCsv = path.join(rawGeneratedDir, 'youtube_products.csv');
  const header = [
    'product','brand','category','videos','views','likes','comments','views_avg','likes_avg','comments_avg','engagement_rate','shorts_ratio','views_median','views_p90','sov_posts','sov_views'
  ];
  const csv = [header.join(',')].concat(rows.map(r => [
    r.product,
    r.brand,
    r.category,
    r.videos,
    r.views,
    r.likes,
    r.comments,
    r.views_avg.toFixed(2),
    r.likes_avg.toFixed(2),
    r.comments_avg.toFixed(2),
    r.engagement_rate.toFixed(6),
    r.shorts_ratio.toFixed(4),
    r.views_median,
    r.views_p90,
    r.sov_posts.toFixed(6),
    r.sov_views.toFixed(6)
  ].join(','))).join('\n');
  fs.writeFileSync(outCsv, csv, 'utf8');

  // -----------------------------
  // 확장 지표: 채널 유형, 주차/요일/시간, Shorts vs Video, 브랜드/시장 점유
  // -----------------------------

  // 채널 유형 분류 휴리스틱
  const isHospitalClinic = (name = '', username = '') => {
    const n = (name || '').toLowerCase();
    const u = (username || '').toLowerCase();
    const k = (name || '') + ' ' + (username || '');
    const kw = ['의원','피부과','성형외과','병원','클리닉','한의원'];
    if (kw.some(w => k.includes(w))) return true;
    if (n.includes('clinic') || n.includes('derma') || n.includes('hospital')) return true;
    if (u.includes('clinic') || u.includes('derma') || u.includes('hospital')) return true;
    return false;
  };
  const isBrand = (name = '', username = '') => {
    const k = (name || '') + ' ' + (username || '');
    const kw = ['Asterasys','아스테라시스','리프테라','쿨페이즈','쿨소닉','공식','official'];
    return kw.some(w => k.toLowerCase().includes(w.toLowerCase()));
  };
  const getChannelType = (name, username) => {
    if (isHospitalClinic(name, username)) return 'hospital_clinic';
    if (isBrand(name, username)) return 'brand';
    return 'creator';
  };

  // 보조: 날짜 가공(KST), ISO 주차
  const toKST = (d) => new Date(new Date(d).getTime() + 9 * 3600 * 1000);
  const isoWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
  };

  // 채널 메트릭 집계
  const byChannel = new Map();
  // 주차/요일/시간 집계
  const byIsoWeek = new Map();
  const byWeekdayHour = new Map(); // key: `${w}-${h}`
  // 제품 x 포맷(Shorts/Video)
  const byProductFormat = new Map(); // key: `${product}|${format}`
  // 브랜드 집계
  const byBrand = new Map();

  const pushBrand = (brand, views, videos) => {
    if (!brand) return;
    const b = byBrand.get(brand) || { brand, videos:0, views:0 };
    b.videos += videos;
    b.views += views;
    byBrand.set(brand, b);
  };

  for (const row of raw) {
    const product = (row.input || '').trim();
    const pInfo = productsMapping.products[product];
    const views = toNumber(row.viewCount);
    const likes = toNumber(row.likes);
    const comments = toNumber(row.commentsCount);
    const isShorts = (row.type === 'shorts') || (String(row.url || '').includes('/shorts/'));

    // 채널
    const chId = row.channelId || '-';
    const chName = row.channelName || chId;
    const chUser = row.channelUsername || '';
    const chType = getChannelType(chName, chUser);
    const subs = toNumber(row.numberOfSubscribers);
    const ch = byChannel.get(chId) || {
      channelId: chId,
      channelName: chName,
      channelUsername: chUser,
      type: chType,
      uploads: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shorts: 0,
      subs_sum: 0,
      _views: [],
    };
    ch.uploads += 1;
    ch.views += views;
    ch.likes += likes;
    ch.comments += comments;
    ch.shorts += isShorts ? 1 : 0;
    ch.subs_sum += subs;
    ch._views.push(views);
    byChannel.set(chId, ch);

    // 주차/요일/시간
    const d = toKST(row.date);
    if (!isNaN(d)) {
      const wk = isoWeek(d);
      const wRec = byIsoWeek.get(wk) || { week: wk, uploads:0, views:0, likes:0, comments:0, shorts:0 };
      wRec.uploads += 1; wRec.views += views; wRec.likes += likes; wRec.comments += comments; wRec.shorts += isShorts?1:0;
      byIsoWeek.set(wk, wRec);
      const weekday = d.getUTCDay();
      const hour = d.getUTCHours();
      const key = `${weekday}-${hour}`;
      const wh = byWeekdayHour.get(key) || { weekday, hour, uploads:0, views:0 };
      wh.uploads += 1; wh.views += views;
      byWeekdayHour.set(key, wh);
    }

    // 제품 x 포맷
    if (byProduct.has(product)) {
      const fmt = isShorts ? 'shorts' : 'video';
      const key = `${product}|${fmt}`;
      const pf = byProductFormat.get(key) || { product, format: fmt, uploads:0, views:0, likes:0, comments:0 };
      pf.uploads += 1; pf.views += views; pf.likes += likes; pf.comments += comments;
      byProductFormat.set(key, pf);
    }

    // 브랜드 집계
    if (pInfo) pushBrand(pInfo.brand, views, 1);
  }

  // 채널 CSV 저장
  const chRows = Array.from(byChannel.values()).map(ch => {
    const avgViews = ch.uploads ? ch.views / ch.uploads : 0;
    const er = ch.views ? (ch.likes + ch.comments) / ch.views : 0;
    const medianViews = quantile(ch._views, 0.5);
    const p90Views = quantile(ch._views, 0.9);
    const shortsRatio = ch.uploads ? ch.shorts / ch.uploads : 0;
    const avgSubs = ch.uploads ? ch.subs_sum / ch.uploads : 0;
    return {
      channelId: ch.channelId,
      channelName: ch.channelName,
      type: ch.type,
      uploads: ch.uploads,
      views: ch.views,
      likes: ch.likes,
      comments: ch.comments,
      avg_views: avgViews,
      er,
      shorts_ratio: shortsRatio,
      median_views: medianViews,
      p90_views: p90Views,
      avg_subscribers: avgSubs,
    };
  }).sort((a,b)=>b.views-a.views);
  const chHeader = ['channelId','channelName','type','uploads','views','likes','comments','avg_views','er','shorts_ratio','median_views','p90_views','avg_subscribers'];
  const chCsv = [chHeader.join(',')].concat(chRows.map(r=>[
    r.channelId,
    (String(r.channelName||'').replace(/,/g,' ')),
    r.type,
    r.uploads,
    r.views,
    r.likes,
    r.comments,
    r.avg_views.toFixed(2),
    r.er.toFixed(6),
    r.shorts_ratio.toFixed(4),
    r.median_views,
    r.p90_views,
    r.avg_subscribers.toFixed(2),
  ].join(','))).join('\n');
  fs.writeFileSync(path.join(ytDir, 'youtube_channel_metrics.csv'), chCsv, 'utf8');

  // 주차 요약
  const wkRows = Array.from(byIsoWeek.values()).sort((a,b)=>a.week.localeCompare(b.week)).map(w=>({
    week: w.week,
    uploads: w.uploads,
    views: w.views,
    likes: w.likes,
    comments: w.comments,
    er: w.views ? (w.likes + w.comments)/w.views : 0,
    shorts_ratio: w.uploads ? w.shorts/w.uploads : 0,
  }));
  const wkHeader = ['week','uploads','views','likes','comments','er','shorts_ratio'];
  const wkCsv = [wkHeader.join(',')].concat(wkRows.map(r=>[
    r.week,r.uploads,r.views,r.likes,r.comments,
    r.er.toFixed(6),r.shorts_ratio.toFixed(4)
  ].join(','))).join('\n');
  fs.writeFileSync(path.join(ytDir, 'youtube_weekly_summary.csv'), wkCsv, 'utf8');

  // 요일-시간 히트맵
  const whRows = Array.from(byWeekdayHour.values()).sort((a,b)=> a.weekday-b.weekday || a.hour-b.hour);
  const whHeader = ['weekday','hour','uploads','views'];
  const whCsv = [whHeader.join(',')].concat(whRows.map(r=>[
    r.weekday, r.hour, r.uploads, r.views
  ].join(','))).join('\n');
  fs.writeFileSync(path.join(ytDir, 'youtube_weekday_hour.csv'), whCsv, 'utf8');

  // 제품 x 포맷
  const pfRows = Array.from(byProductFormat.values()).sort((a,b)=> (a.product===b.product? (a.format>b.format?1:-1) : a.product>b.product?1:-1)).map(r=>({
    product: r.product,
    format: r.format,
    uploads: r.uploads,
    views: r.views,
    likes: r.likes,
    comments: r.comments,
    er: r.views ? (r.likes + r.comments)/r.views : 0,
  }));
  const pfHeader = ['product','format','uploads','views','likes','comments','er'];
  const pfCsv = [pfHeader.join(',')].concat(pfRows.map(r=>[
    r.product, r.format, r.uploads, r.views, r.likes, r.comments, r.er.toFixed(6)
  ].join(','))).join('\n');
  fs.writeFileSync(path.join(ytDir, 'youtube_product_format.csv'), pfCsv, 'utf8');

  // 브랜드 시장 점유(views, uploads)
  const brandRows = Array.from(byBrand.values()).sort((a,b)=>b.views-a.views);
  const brandCsv = ['brand,videos,views,sov_posts,sov_views'].concat(brandRows.map(b=>[
    b.brand,
    b.videos,
    b.views,
    (totalVideos? b.videos/totalVideos:0).toFixed(6),
    (totalViews? b.views/totalViews:0).toFixed(6)
  ].join(','))).join('\n');
  const marketShareCsvPath = path.join(rawGeneratedDir, 'youtube_market_share.csv');
  fs.writeFileSync(marketShareCsvPath, brandCsv, 'utf8');

  // 대시보드 요약 + Top 추천(병원/클리닉 채널)
  const topHospitals = chRows.filter(r=>r.type==='hospital_clinic').slice(0,50);
  const summary = {
    totals: { videos: totalVideos, views: totalViews, likes: totalLikes, comments: totalComments },
    products: rows.length,
    brands: brandRows.map(b=>({ brand: b.brand, sov_posts: totalVideos? b.videos/totalVideos:0, sov_views: totalViews? b.views/totalViews:0 })),
    weekly: wkRows,
    topChannels: chRows.slice(0,50),
    topHospitalClinicChannels: topHospitals,
    processedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(ytDir, 'youtube_dashboard_summary.json'), JSON.stringify(summary,null,2),'utf8');

  // Asterasys 인사이트(협업 후보): 병원/클리닉 중 ER 상위 및 평균 조회 상위 교집합 Top 20
  const hospByER = topHospitals.slice().sort((a,b)=>b.er-a.er).slice(0,40);
  const hospByAvgViews = topHospitals.slice().sort((a,b)=>b.avg_views-a.avg_views).slice(0,40);
  const setIds = new Set(hospByER.map(x=>x.channelId));
  const candidates = hospByAvgViews.filter(x=>setIds.has(x.channelId)).slice(0,20);
  fs.writeFileSync(path.join(ytDir, 'asterasys_youtube_insights.json'), JSON.stringify({ candidates, criteria: 'hospital_clinic & top ER ∩ top avg_views' }, null, 2), 'utf8');

  // 콘솔 요약 출력(18개 전부)
  console.log('YouTube 제품별 정량 집계 완료');
  console.log('원본 파일:', path.relative(root, scraperFile));
  console.log('총합(영상/조회/좋아요/댓글):', totalVideos, totalViews, totalLikes, totalComments);
  console.log('출력:', path.relative(root, outJson), ',', path.relative(root, outCsv));
  console.log('추가 출력:');
  console.log(' -', path.relative(root, path.join(ytDir, 'youtube_channel_metrics.csv')));
  console.log(' -', path.relative(root, path.join(ytDir, 'youtube_weekly_summary.csv')));
  console.log(' -', path.relative(root, path.join(ytDir, 'youtube_weekday_hour.csv')));
  console.log(' -', path.relative(root, path.join(ytDir, 'youtube_product_format.csv')));
  console.log(' -', path.relative(root, marketShareCsvPath));
  console.log(' -', path.relative(root, path.join(ytDir, 'youtube_dashboard_summary.json')));
  console.log(' -', path.relative(root, path.join(ytDir, 'asterasys_youtube_insights.json')));
  console.log('\nTop (조회수 기준):');
  for (const r of rows) {
    console.log(
      `${r.product}\tvideos=${r.videos}\tviews=${r.views}\tlikes=${r.likes}\tcomments=${r.comments}\tER=${(r.engagement_rate*100).toFixed(2)}%\tSOV_views=${(r.sov_views*100).toFixed(2)}%`
    );
  }
}

try {
  main();
} catch (e) {
  console.error('처리 실패:', e.message);
  process.exit(1);
}
