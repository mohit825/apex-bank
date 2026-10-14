import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

export default function DashboardLayout({
  children,
  modal,
}: DashboardLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
