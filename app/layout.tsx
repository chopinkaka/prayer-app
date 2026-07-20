export const metadata = {
  title: '중보기도 기도제목',
  description: '기도제목을 남겨주시면 함께 기도하겠습니다',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "'Apple SD Gothic Neo', '맑은 고딕', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
