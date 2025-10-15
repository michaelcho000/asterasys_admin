import "./globals.css";
import "../assets/scss/theme.scss";
import 'react-circular-progressbar/dist/styles.css';
import "react-perfect-scrollbar/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import NavigationProvider from "@/contentApi/navigationProvider";
import SettingSideBarProvider from "@/contentApi/settingSideBarProvider";
import ThemeCustomizer from "@/components/shared/ThemeCustomizer";
import ClientChatbotWrapper from "@/components/asterasys/AIChatbot/ClientChatbotWrapper";

export const metadata = {
  title: "Asterasys Marketing KPI Dashboard",
  description: "RF/HIFU 의료기기 마케팅 인텔리전스 대시보드 - 2025년 8월 실제 데이터 기반 전문 분석 플랫폼",
  keywords: "의료기기, RF, HIFU, 마케팅 분석, KPI 대시보드, 경쟁사 분석",
  author: "Asterasys",
  language: "ko-KR"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <SettingSideBarProvider>
          <NavigationProvider>
            {children}
            <ClientChatbotWrapper />
          </NavigationProvider>
        </SettingSideBarProvider>
      </body>
    </html>
  );
}
