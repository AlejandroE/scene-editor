import "@google/model-viewer";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import emoji from '../util/emoji'
import debounce from '../util/debounce'

const ModelThree = (props) => {
  const {bg, autoRotate, camera, setCamera, cameraLimits, environment, presetCamera, setCameraLimits} =
    props;
  const {rho, phi, theta} = camera;
  const {limitsEnabled, limitPhi, limitRho, limitTheta} = cameraLimits;

  const [hotspotCounter, setHotspotCounter] = useState(0);
  const [activeSpot, setActiveSpot] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [startCamOrbit, setStartCamOrbit] = useState(null);

  const [cameraRadiusRatio, setCameraRadiusRatio] = useState(0);
  const [maxOrbit, setMaxOrbit] = useState(null);
  const [minOrbit, setMinOrbit] = useState(null);
  const viewer = useRef(null);
  const prevPropsRef = useRef({ rho: 0, theta: 0, phi: 0 });
  const prevProps = prevPropsRef.current;

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
    if (viewer?.current && presetCamera) {
      setCamera(presetCamera);
    }
  },[presetCamera, setCamera]);
  
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
      console.log(minOrbit, maxOrbit);
      setMinOrbit(minOrbit);
      setMaxOrbit(maxOrbit);
    } else {
      setMaxOrbit(null);
      setMinOrbit(null);
    }
  }, [limitsEnabled, limitTheta, limitRho, limitPhi]);

  const resetView = () => {
      viewer.current.cameraTarget = 'auto auto auto';
      viewer.current.cameraOrbit = 'auto auto auto';
    setCamera({theta: 0, phi: 75, rho: 105});
  };

  useEffect(() => {
    if (viewer && viewer.current) {
      const currentViewer = viewer.current;
      viewer.current.addEventListener("load", () => {
        const {radius} = currentViewer.getCameraOrbit();
        setStartCamOrbit(currentViewer.getCameraOrbit());
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
      viewer.current.addEventListener('dblclick', onClick);

      viewer.current.addEventListener(
        "camera-change", onCameraChange
      );
    }
    return () => {
      viewer.current.removeEventListener('camera-change', onCameraChange);
      viewer.current.removeEventListener('dblclick', onClick);
    }
  });

  const onCameraChange = debounce(({target, detail}) => {
    if (detail.source !== "none") {
      const coordinates = radiansToDegOrbit(target.getCameraOrbit());
      setCamera({...coordinates});
    }
  });

  const recenter = (pointer) => {
    // panning = false;
    let startX = event.clientX;
    let startY = event.clientY;
    const tapDistance = 2
    if (Math.abs(pointer.clientX - startX) > tapDistance ||
      Math.abs(pointer.clientY - startY) > tapDistance)
      return;
    const hit = viewer.current.positionAndNormalFromPoint(pointer.clientX, pointer.clientY);
    if(hit != null) {
      viewer.current.cameraTarget = hit.position.toString();
    }
    else {
      viewer.current.cameraTarget = 'auto auto auto';
      viewer.current.cameraOrbit = 'auto auto auto';
    }
  };

  function onClick(event) {
    if (viewer?.current) {
      const rect = viewer.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const positionAndNormal = viewer.current.positionAndNormalFromPoint(x, y);

      if (positionAndNormal == null) {
        console.log('no hit result: mouse = ', x, ', ', y);
        return;
      }
      const {position, normal} = positionAndNormal;
      console.log('position', position, 'normal', normal)

      const counter = hotspotCounter + 1;
      
      setHotspotCounter(counter)
      setHotspots([...hotspots, 
        <button 
          key={counter}
          className="hotspot"
          data-position={position.toString()}
          data-normal={normal ? normal.toString() : null}
          onClick={() => setActiveSpot(counter)}
          slot={"hotspot-" + counter}>
          {emoji()}
        </button>]) 

      setActiveSpot(() => counter)
      recenter(event);
      
      viewer.current.removeEventListener('dblclick', onClick);
    }
  };
  
  useLayoutEffect(() => {
    if (activeSpot) {
      document.getElementById("save").textContent =
        'Save ' + document.querySelector(`[slot="hotspot-${activeSpot}"]`).textContent;
      
      const hotspot = hotspots[activeSpot - 1];
        
      const cameraLimitsVals = {
        limitsEnabled: true,
        limitRho: hotspot.props['data-limit-rho'] ,
        limitTheta: hotspot.props['data-limit-theta'],
        limitPhi: hotspot.props['data-limit-phi'],
      };

      if (hotspot.props['data-cam-rho']) { 
        setCamera({
          rho: hotspot.props['data-cam-rho'], 
          phi: hotspot.props['data-cam-phi'], 
          theta: hotspot.props['data-cam-theta'],
        })
       
      }
      setCameraLimits(cameraLimitsVals)
    }
  }, [activeSpot]);

  const saveHotspotConfig = (event) => {
    const hotspot = hotspots[activeSpot - 1];
    hotspots[activeSpot - 1] = <button 
      key={hotspot.key}
      {...hotspot.props}
      data-limit-theta={limitTheta}
      data-limit-phi={limitPhi}
      data-limit-rho={limitRho}
      data-cam-rho={rho} 
      data-cam-phi={phi} 
      data-cam-theta={theta}
    />
    console.log('saving...')
    setHotspots(hotspots);
  };

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
          limitsEnabled && maxOrbit
            ? `${maxOrbit.theta}deg ${maxOrbit.phi}deg ${maxOrbit.rho}%`
            : null
        }
        min-camera-orbit={
          limitsEnabled && minOrbit
            ? `${minOrbit.theta}deg ${minOrbit.phi}deg ${minOrbit.rho}%`
            : null
        }
        ar
      >
        {hotspots}
        <div className='controls'>
        <button className="btn" id="view-reset" onClick={resetView}>View reset</button>
        <button className="btn" id="save" onClick={saveHotspotConfig}>Save</button>
        </div>
      </model-viewer>
    </div>
  );
};

export default ModelThree;
