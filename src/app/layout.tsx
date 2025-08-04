export const metadata = {
  title: "Just Swim - 수영 커뮤니티",
  description: "수영 기록을 공유하고 피드백을 받는 수영 커뮤니티 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
