import NavBar from "@/components/navBar";

export default function Home() {
    return (
        <main>
            <NavBar />
            <div className="page-main">
                <h1>About CRLSpen</h1>
                <h2>Overview</h2>
                <div className="about-text">
                    CRLSpen is a open-source web app made by and for CRLS students. It allows students to check their grades, assignments, schedule, and GPA.
                    <br />
                    <br />
                    The app is built using Next.js, a React framework, and is hosted on Vercel. The backend is written in TypeScript and scrapes data from Aspen, the student information system used by CRLS.
                    <br />
                    <br />
                    The app is not affiliated with CRLS or the Cambridge Public School District.
                    <br />
                    <br />
                    The source code for the app can be found on <a href="https://github.com/Aspine/crlspen">our GitHub repository</a>.
                </div>
                <h2>Deployment & Data</h2>
                <div className="about-text">
                    CRLSpen is currently deployed on Vercel, a deployment which can be found <a href="https://crlspen-deploy.vercel.app/">here</a>.
                    <br />
                    <br />
                    The app is hosted on a free plan, which means that it may be slow to load and may have downtime.
                    <br />
                    <br />
                    Due to the nature of scraping Aspen, your username and password are transferred to Vercel servers. We do not store your credentials, but we cannot guarantee that they are not stored by Vercel.
                    <br />
                    <br />
                    If you are concerned about privacy, you can host the app yourself. Instructions for doing so can be found below.
                </div>
                <h2>Self-Hosting</h2>
                <div className="about-text">
                    If you would like to host the app yourself, you can do so by following these steps:
                    <ol>
                        <li>Clone the repository from <a href="https://github.com/Aspine/crlspen">here</a></li>
                        <li>Install Node.js and npm</li>
                        <li>Run <code>npm install</code> in the root directory of the repository</li>
                        <li>Run <code>npm run dev</code> to start the development server</li>
                        <li>Access the app at <code>http://localhost:3000</code> in your browser</li>
                    </ol>
                </div>
            </div>
        </main>
    )
}