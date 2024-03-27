import falconImage from "@/../public/falcon.png";
import Image from "next/image";

export default function LoadingScreen({ loadText }: { loadText: string }) {
    return (
        <main>
            <div className="loading-screen">
                <h1>{loadText}</h1>
                <Image
                    src={falconImage}
                    alt="loading"
                    width={100}
                    height={100}
                    className="loading-image"
                />
            </div>
        </main>
    );
}