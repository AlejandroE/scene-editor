import dynamic from "next/dynamic";

const Controls = dynamic(() => import("../components/ControlsTwo"), {
  ssr: false,
});

export default function Due() {
  return <Controls />;
}
