import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useAppContext } from "../../contexts/AppProvider"
import Player from "../../components/Player"
import { RigidBody } from "@react-three/rapier"
import { ScifiLab } from "../../models/ScifiLab"
import { useParams } from "react-router-dom"
import { Image, useGLTF } from "@react-three/drei"
import { last } from "lodash"
import { GroupProps, useFrame, useThree } from "@react-three/fiber"
import { useListingToken, useOwnerOfToken, useToken, useTokenActivities } from "../../hooks"
import * as THREE from "three"
import { getIPFSUri, shortenAddress } from "../../utils"
import { Container, DefaultProperties, Root, Text } from "@react-three/uikit"
import { ArrowLeftRight, Boxes, FilePlus, FileX } from "@react-three/uikit-lucide"
import { Card } from "../../components/default/card"
import { Token } from "../../types/graphql"
import { format } from "date-fns"
import { Button } from "../../components/default/button"
import { useWalletContext } from "../../contexts/WalletProvider"
import { useToastContext } from "../../contexts/ToastContainer"
import { MARKETPLACE_ADDRESS } from "../../configs/addresses"
import { RatioImage } from "../../components/override/RatioImage"

// export async function loader({ params }: { params: { id: string } }) {
//     const { id } = params;
//     const { data } = await client.query({
//         query: GET_TOKEN_BY_ID,
//         variables: {
//             id
//         }
//     })

//     return data.tokenById
// }

export function Component() {
    const { setEvnPreset } = useAppContext()

    useEffect(() => {
        setEvnPreset("dawn")
    }, [])
    return (
        <>
            <ambientLight intensity={1} color="#BBBBBB" />
            <directionalLight position={[2.5, 5, 5]} color="#FFFFFF" intensity={0.6} castShadow />
            <RigidBody mass={1} type="fixed" colliders={"trimesh"} scale={0.5} position={[0, 0.5, 0]} >
                <ScifiLab />
            </RigidBody>
            <Player initial={[0, 1, 0]} />
            <NFT />
        </>
    )
}

export function NFT() {
    // const token = useLoaderData() as Token | null

    const { id } = useParams()
    const { data } = useToken(id!)
    const token = data?.tokenById


    if (!token) return <></>

    const image = getIPFSUri(token.image)

    return (
        <>
            {
                token.animation &&
                <Suspense>
                    <Model animation={token.animation} />
                </Suspense>
            }
            {
                token.image &&
                <Suspense>
                    {/* <DragControls
                        onDrag={(localMatrix: Matrix4, _: Matrix4, worldMatrix: Matrix4, __: Matrix4) => {
                            console.info(localMatrix, worldMatrix,)
                        }}
                    >
                    </DragControls> */}
                    <Image url={image} position={[-4.7, 1.37, -1.7]} rotation={[0, 1.9, 0]} scale={2.2} />
                    <Image url={image} position={[4.7, 1.37, -1.7]} rotation={[0, -1.9, 0]} scale={2.2} />
                    <Image url={image} position={[-3, 1.37, -7.31]} rotation={[0, 0.64, 0]} scale={2.2} />
                    <Image url={image} position={[3, 1.37, -7.31]} rotation={[0, -0.64, 0]} scale={2.2} />
                    <FramedImage image={image} position={[0, 1.5, -3.2]} />
                </Suspense>
            }
            <mesh position={[-0.05, 1.37, -7.86]} rotation={[0, 0.015, 0]}>
                <Root width={400} height={205} backgroundColor="DodgerBlue" padding={20} flexDirection="column">
                    <DefaultProperties color="PaleTurquoise">
                        <Container justifyContent="space-between">
                            <Text fontSize={20} fontWeight={600}>{token.name || `#${token.tokenId}`}</Text>
                            <Container gap={4} alignItems="center" alignContent="center">
                                <Boxes width={16} />
                                <Text fontWeight={500}>{token.collection.name}</Text>
                            </Container>
                        </Container>
                        {
                            token.description &&
                            <Text fontSize={12} marginTop={4}>{token.description}</Text>
                        }
                        <Container marginY={10} height={1} width="100%" backgroundColor="PaleTurquoise" />
                        <Text fontWeight={500} marginBottom={8}>Attributes</Text>
                        <Container flexDirection="row" flexWrap="wrap" gap={4} justifyContent="space-around">
                            {
                                token.attributes.map(attr => (
                                    <Card key={attr.traitType} borderColor="PaleTurquoise" backgroundOpacity={0} padding={4} borderRadius={4} hover={{ backgroundOpacity: 0.1 }}>
                                        <Text fontWeight={500} fontSize={8} color="PaleTurquoise">{attr.traitType}</Text>
                                        <Text fontSize={8} color="PaleTurquoise">{attr.value}</Text>
                                    </Card>
                                ))
                            }
                        </Container>
                    </DefaultProperties>
                </Root>
            </mesh>
            <mesh position={[4.35, 1.37, -4.79]} rotation={[0, -1.2405, 0]}>
                <ActivityScreen token={token} />
            </mesh>
            <ActionScreen token={token} />
        </>
    )
}

export function Model({ animation }: { animation: string }) {
    const ref = useRef<THREE.Group>(null)

    const src = animation.startsWith("https://turnon.meebits.app/viewer/") ? "https://livingpfp.meebits.app/api/meebits?type=3d&token_id=" + last(animation.split("/")) : ""

    const gltf = useGLTF(src)

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta / 2
        }
    })

    return (
        <group ref={ref} position={[0, 0.8, -3.2]}>
            <primitive object={gltf.scene} />
        </group>
    )
}

export function FramedImage({ image, ...props }: { image: string } & GroupProps) {
    const imageRef = useRef<THREE.Mesh>(null)
    const ref = useRef<THREE.Group>(null)
    const [width, setWidth] = useState<number>(1)

    useEffect(() => {
        if (imageRef.current) {
            setWidth(imageRef.current.scale.x)
        }
    }, [imageRef,])

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta / 2
        }
    })

    return (
        <group ref={ref} {...props}>
            <mesh position={[0, 0, -0.026]}>
                <boxGeometry args={[width * 1.1, 1 * 1.1, 0.05]} />
                <meshStandardMaterial color="cyan" metalness={0.5} roughness={0.5} envMapIntensity={2} polygonOffset={true} polygonOffsetFactor={1} />
            </mesh>
            <RatioImage
                ref={imageRef}
                url={image}
                toneMapped
                scale={1}
                depth={0}
            />
            <RatioImage
                ref={imageRef}
                url={image}
                toneMapped
                scale={1}
                depth={0}
                position={[0, 0, -0.051]}
            />
        </group>
    )
}

export function ActivityScreen({ token }: { token: Token }) {
    const { data } = useTokenActivities(token.id)
    return (
        <Root width={380} height={170} backgroundColor="MidnightBlue" backgroundOpacity={0.9} paddingY={20} paddingX={40} flexDirection="column" justifyContent="flex-start">
            <DefaultProperties color="cyan">
                <Container overflow="scroll" flexDirection="column">
                    <Text fontWeight={500} marginBottom={8}>Activity</Text>
                    <Container flexDirection="column" borderColor="cyan" borderWidth={1} borderRadius={16} padding={16} gap={8}>
                        {
                            data?.activities.map(activity => {
                                const icon = activity["@type"] === "TRANSFER" ? <ArrowLeftRight width={16} /> :
                                    activity["@type"] === "MINT" ? <FilePlus width={16} /> :
                                        activity["@type"] === "BURN" ? <FileX width={16} /> : <></>
                                const content = activity["@type"] === "TRANSFER" ?
                                    <Container>
                                        <Text fontWeight={500}>{shortenAddress(activity.from.slice(9))}</Text><Text marginX={2}> transfered to </Text><Text fontWeight={500}>{shortenAddress(activity.owner.slice(9))}</Text> :
                                    </Container>
                                    :
                                    activity["@type"] === "MINT" ?
                                        <Container>
                                            <Text fontWeight={500}>{shortenAddress(activity.owner.slice(9))}</Text><Text marginX={2}> minted</Text>
                                        </Container>
                                        :
                                        activity["@type"] === "BURN" ?
                                            <Container>
                                                <Text fontWeight={500}>{shortenAddress(activity.owner.slice(9))}</Text><Text marginX={2}> burned</Text>
                                            </Container>
                                            :
                                            <></>

                                return (
                                    <Container flexDirection="row" key={activity.cursor} alignItems="center" gap={8}>
                                        {icon}
                                        <Container flexDirection="column">
                                            <DefaultProperties fontSize={8}>
                                                {content}
                                            </DefaultProperties>
                                            <Text fontSize={8} opacity={0.8}>at {format(activity.date, "dd-MM-yyyy, hh:mm")}</Text>
                                        </Container>
                                    </Container>
                                )
                            })
                        }
                    </Container>
                </Container>
            </DefaultProperties>
        </Root>
    )
}

const camPosition = new THREE.Vector3()
const objPosition = new THREE.Vector3()
export function ActionScreen({ token }: { token: Token }) {
    const ref = useRef<THREE.Mesh>(null)
    const { wallet } = useWalletContext()
    const { toast } = useToastContext()
    const { data: owner } = useOwnerOfToken(token.id)
    const listing = owner === MARKETPLACE_ADDRESS
    const { data } = useListingToken(token.id, !listing)
    const isMyToken = wallet ? (wallet.address === owner || wallet.address === data?.listEvents[0]?.seller) : false

    const handleClickBuy = useCallback(() => {
        if (!wallet) return toast({ text: "Open menu to connect wallet", variant: "warning" })
    }, [wallet, token])

    const handleClickOffer = useCallback(() => {
        if (!wallet) return toast({ text: "Open menu to connect wallet", variant: "warning" });
        toast({ text: "Coming soon...", variant: "info" })
    }, [wallet, token])

    const handleOpenMenuClick = useCallback(() => {
        toast({ text: "Open menu to continue", variant: "info" })
    }, [])

    useFrame((state, delta) => {
        if (ref.current) {
            state.camera.getWorldPosition(camPosition)
            ref.current.getWorldPosition(objPosition)
            const distance = camPosition.distanceTo(objPosition)
            if (distance >= 4) {
                ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, -4.35, delta * 3)
                ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, -4.62, delta * 3)
                ref.current.scale.copy(ref.current.scale.lerp({ x: 1, y: 1, z: 1 }, delta * 3))
            } else {
                ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, -4.2, delta * 3)
                ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, -4.5, delta * 3)
                ref.current.scale.copy(ref.current.scale.lerp({ x: 1.1, y: 1.1, z: 1.1 }, delta * 3))
            }
        }
    })

    return (
        <mesh ref={ref} position={[-4.35, 1.37, -4.62]} rotation={[0, 1.272, 0]}>
            <Root borderRadius={32} width={370} height={170} backgroundOpacity={0.95} backgroundColor="MidnightBlue" paddingY={20} paddingX={40} flexDirection="column" justifyContent="flex-start">
                <DefaultProperties color="cyan">
                    <Container flexDirection="column">
                        <Text fontWeight={500} marginBottom={8}>Action</Text>
                        <Container flexDirection="column" gap={8}>
                            {
                                isMyToken && !listing &&
                                <Button borderWidth={1} backgroundOpacity={0} hover={{ backgroundColor: "cyan", backgroundOpacity: 0.1 }} borderColor="cyan" width="100%" gap={8} onClick={handleOpenMenuClick}>
                                    <Text color="cyan">Listing</Text>
                                </Button>
                            }
                            {
                                isMyToken && listing &&
                                <Button borderWidth={1} backgroundOpacity={0} hover={{ backgroundColor: "cyan", backgroundOpacity: 0.1 }} borderColor="cyan" width="100%" gap={8} onClick={handleOpenMenuClick}>
                                    <Text color="cyan">Cancel Listing</Text>
                                </Button>
                            }
                            {
                                !isMyToken && !listing &&
                                <>
                                    <Button borderWidth={1} backgroundOpacity={0} hover={{ backgroundColor: "cyan", backgroundOpacity: 0.1 }} borderColor="cyan" width="100%" gap={8} onClick={handleClickOffer}>
                                        <Text color="cyan">Offer</Text>
                                    </Button>
                                </>
                            }
                            {
                                !isMyToken && listing &&
                                <Button borderWidth={1} backgroundOpacity={0} hover={{ backgroundColor: "cyan", backgroundOpacity: 0.1 }} borderColor="cyan" width="100%" gap={8} onClick={handleClickBuy}>
                                    <Text color="cyan">Buy</Text>
                                </Button>
                            }
                        </Container>
                    </Container>
                </DefaultProperties>
            </Root>
        </mesh>
    )
}