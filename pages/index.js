import dynamic from "next/dynamic";

const Controls = dynamic(() => import("../components/Controls"), {
  ssr: false,
});

export default function Home() {
  return <Controls />;
}
