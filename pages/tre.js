import dynamic from "next/dynamic";

const Controls = dynamic(() => import("../components/ControlsThree"), {
  ssr: false,
});

export default function Tre() {
  return <Controls />;
}
