export const metadata = {
  title: '아둘람 청년부 중보기도',
  description: '함께 마음을 모아 기도해요. 나누고 싶은 기도제목을 남겨주시면 청년부가 함께 중보합니다.',
};

export const viewport = {
  themeColor: '#4CAF50',
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
