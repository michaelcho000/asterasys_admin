# 프로젝트 전용 Claude Code Agents

이 폴더에는 현재 프로젝트에서 사용할 수 있는 전문 agents가 포함되어 있습니다.

## 사용 가능한 Agents

### 프로그래밍 언어 전문가
- `@python-pro` - Python 전문가
- `@javascript-pro` - JavaScript/TypeScript 전문가
- `@golang-pro` - Go 언어 전문가
- `@rust-pro` - Rust 전문가
- `@cpp-pro` - C++ 전문가
- `@c-pro` - C 언어 전문가
- `@php-pro` - PHP 전문가
- `@sql-pro` - SQL/데이터베이스 전문가

### 개발 도구 전문가
- `@code-reviewer` - 코드 리뷰 전문가
- `@debugger` - 디버깅 전문가
- `@error-detective` - 에러 분석 전문가
- `@mcp-expert` - MCP 서버 전문가
- `@command-expert` - CLI 명령어 전문가
- `@context-manager` - 컨텍스트 관리 전문가
- `@dx-optimizer` - 개발자 경험 최적화 전문가

## 사용 방법

```bash
# 특정 agent 호출
claude "@python-pro Django REST API 설계"

# 자동 활성화 (관련 키워드 감지)
claude "Python 비동기 프로그래밍 최적화"
```

## 프로젝트 범위

이 agents는 **현재 프로젝트에서만** 사용 가능합니다.
전역으로 사용하려면 `~/.claude/agents/` 폴더로 복사하세요.