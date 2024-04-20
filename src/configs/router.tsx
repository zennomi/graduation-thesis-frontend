import { createBrowserRouter } from "react-router-dom";
import XRLayout from "../layouts/XRLayout";
import PhysicsLayout from "../layouts/Physics";

const router = createBrowserRouter([
    {
        path: "/xr",
        element: <XRLayout />,
        children: [
            {
                path: "/xr/home",
                lazy: () => import("../pages/Home"),
            },
            {
                path: "/xr/physics",
                element: <PhysicsLayout />,
                children: [
                    {
                        path: "/xr/physics/collection",
                        lazy: () => import("../pages/Collection")
                    },
                    {
                        path: "/xr/physics/nft",
                        lazy: () => import("../pages/Asset")
                    },
                ]
            },

        ]
    },
    {
        path: "/test",
        lazy: () => import("../pages/Test")
    },
]);

export default router