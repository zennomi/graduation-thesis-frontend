/* eslint-disable react/display-name */
import { useXR } from "@coconut-xr/natuerlich/react";
import { PerspectiveCameraProps, useStore } from "@react-three/fiber";
import { useEffect, useImperativeHandle, useRef } from "react";
import { forwardRef } from "react";
import { PerspectiveCamera } from "three";

const manualCameraProp = { manual: true } as any;

/**
 * component to position and rotate the camera when not in immersive mode
 */
export const NonImmersiveCamera = forwardRef<PerspectiveCamera, PerspectiveCameraProps>(
    (props, ref) => {
        const store = useStore();
        const internalRef = useRef<PerspectiveCamera>(null);
        useImperativeHandle(ref, () => internalRef.current!, []);

        const enabled = useXR(({ mode }) => mode === "none");

        useEffect(() => {
            if (!enabled) {
                return;
            }
            const newCamera = internalRef.current;
            if (newCamera == null) {
                return;
            }
            const prevCamera = store.getState().camera;
            console.log(prevCamera)
            store.setState({ camera: newCamera });

            //aspect ratio
            const unsubscribe = store.subscribe((state, prevState) => {
                if (
                    state.size.width === prevState.size.width &&
                    state.size.height === prevState.size.height
                ) {
                    return;
                }
                newCamera.aspect = state.size.width / state.size.height;
                newCamera.updateProjectionMatrix();
            });

            const { size } = store.getState();
            newCamera.aspect = size.width / size.height;
            newCamera.updateProjectionMatrix();

            return () => {
                unsubscribe();
                if (store.getState().camera != newCamera) {
                    //camera was already changed to another one
                    return;
                }
                store.setState({ camera: prevCamera });
            };
        }, [store, enabled]);

        if (!enabled) {
            return null;
        }

        return <perspectiveCamera {...manualCameraProp} ref={internalRef} {...props} />;
    },
);