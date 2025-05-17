import Header from "./Header";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Header />
    <main style={{ padding: 16 }}>{children}</main>
  </>
);
