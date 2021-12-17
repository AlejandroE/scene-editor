import "@google/model-viewer";
import { useEffect, useRef, useState, memo } from "react";

function debounce(func, timeout = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const Model = (props) => {
  const { bg, autoRotate, camera, setCamera, cameraLimits, environment } =
    props;
  const { rho, phi, theta } = camera;
  const { limitsEnabled, limitPhi, limitRho, limitTheta } = cameraLimits;

  const [isEnvLight, setIsEnvLight] = useState(false);
  const [cameraRadiusRatio, setCameraRadiusRatio] = useState(0);
  const [maxOrbit, setMaxOrbit] = useState(null);
  const [minOrbit, setMinOrbit] = useState(null);
  const viewer = useRef(null);
  const prevPropsRef = useRef({ rho: 0, theta: 0, phi: 0 });
  const prevProps = prevPropsRef.current;

  const handleLightChange = () => {
    setIsEnvLight(!isEnvLight);
  };

  const radiansToDegOrbit = ({ theta, phi, radius, rho }) => {
    rho = rho ? rho : radius;
    const coordinates = {
      theta: parseInt((theta * (180 / Math.PI)) % 360),
      phi: parseInt(phi * (180 / Math.PI)),
      rho: rho * (100 / cameraRadiusRatio),
    };

    // coordinates.theta =
    // coordinates.theta >= 0 ? coordinates.theta : coordinates.theta + 360;

    return coordinates;
  };

  useEffect(() => {
    prevPropsRef.current = props;
  });

  useEffect(() => {
    if (viewer?.current && limitsEnabled) {
      const { theta, phi, rho } = radiansToDegOrbit(
        viewer.current.getCameraOrbit()
      );
      const maxOrbit = {
        theta: theta + limitTheta / 2,
        phi: phi + limitPhi / 2,
        rho: rho + limitRho / 2,
      };

      const minOrbit = {
        theta: theta - limitTheta / 2,
        phi: phi - limitPhi / 2,
        rho: rho - limitRho / 2,
      };
      console.log(maxOrbit, minOrbit);
      setMinOrbit(minOrbit);
      setMaxOrbit(maxOrbit);
    } else {
      setMaxOrbit(null);
      setMinOrbit(null);
    }
  }, [limitTheta, limitRho, limitPhi, limitsEnabled]);

  useEffect(() => {
    if (viewer && viewer.current) {
      const currentViewer = viewer.current;
      viewer.current.addEventListener("load", () => {
        const { radius } = currentViewer.getCameraOrbit();
        setCameraRadiusRatio(radius / 1.05);
      });
    }
  });

  useEffect(() => {
    if (viewer?.current) {
      if (
        theta != prevProps.theta ||
        phi != prevProps.phi ||
        rho != prevProps.rho
      ) {
        viewer.current.cameraOrbit = `${theta}deg ${phi}deg ${rho}%`;
      }
    }
  }, [rho, phi, theta]);

  useEffect(() => {
    if (viewer?.current) {
      viewer.current.addEventListener(
        "camera-change",
        debounce(({ target, detail }) => {
          if (detail.source !== "none") {
            const coordinates = radiansToDegOrbit(target.getCameraOrbit());
            setCamera({ ...coordinates });
          }
        })
      );
    }
  });

  return (
    <div id="card">
      <model-viewer
        ref={viewer}
        id="viewer"
        style={{ "--poster-color": bg, backgroundColor: bg }}
        src="/Astronaut.glb"
        poster="https://cdn.glitch.com/36cb8393-65c6-408d-a538-055ada20431b%2Fposter-astronaut.png?v=1599079951717"
        alt="A 3D model of an astronaut"
        shadow-intensity="1"
        auto-rotate={autoRotate ? true : null}
        interaction-prompt="none"
        camera-controls={true}
        skybox-image={environment}
        max-camera-orbit={
          maxOrbit
            ? `${maxOrbit.theta}deg ${maxOrbit.phi}deg ${maxOrbit.rho}%`
            : null
        }
        min-camera-orbit={
          minOrbit
            ? `${minOrbit.theta}deg ${minOrbit.phi}deg ${minOrbit.rho}%`
            : null
        }
        ar
      ></model-viewer>
    </div>
  );
};

export default Model;
