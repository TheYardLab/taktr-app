// pages/index.tsx
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: { destination: "/login", permanent: false },
  };
};

export default function Index() {
  return null;
}