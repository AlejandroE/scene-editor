import { useControls } from "leva";
import Model from "./Model";

const Controls = () => {
  const bgVal = {
    bg: "#c23d3d",
  };

  const predefinedCameras = {
    one: "50deg 58deg 105%",
    two: "53deg 15deg 47%",
  };

  const cameraVals = {
    rho: { value: 105, min: 0, max: 150, step: 1 },
    theta: { value: 0, min: -360, max: 360, step: 1 },
    phi: { value: 75, min: 0, max: 180, step: 1 },
  };

  const cameraLimitsVals = {
    limitsEnabled: false,
    limitRho: { value: 50, min: 0, max: 110, step: 1 },
    limitTheta: { value: 360, min: 0, max: 360, step: 1 },
    limitPhi: { value: 60, min: 0, max: 180, step: 1 },
  };

  const environments = {
    none: null,
    indoors: "env_b_1k.hdr",
    outdoors: "env_a_1k.hdr",
  };

  const { bg } = useControls(bgVal);
  const { autoRotate } = useControls({ autoRotate: false }); // auto rotate effes up the sperical coords & doesn't respect limits
  const { presetCameras } = useControls({
    presetCameras: { options: predefinedCameras },
  });

  const { environment } = useControls({
    environment: { options: environments },
  });
  const [camera, setCamera] = useControls("camera", () => cameraVals);
  const [cameraLimits, setCameraLimits] = useControls(
    "camera limits",
    () => cameraLimitsVals
  );

  const controls = {
    bg,
    autoRotate,
    environment,
    presetCameras,
    camera,
    cameraLimits,
    setCamera,
    setCameraLimits,
  };

  return <Model {...controls} />;
};

export default Controls;
