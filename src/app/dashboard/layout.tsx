import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

export default function DashboardLayout({
  children,
  modal,
}: DashboardLayoutProps) {
  console.log(modal, "ooo");
  return (
    <>
      {children}
      {modal}
    </>
  );
}
