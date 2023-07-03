 // Import Assets
 import uniswap from '../assets/uniswap.png';
 import compound from '../assets/compound.png';
 import goldenliquidity from '../assets/goldenliquidity.png';
 
 export const Courses = () => {
    return (
        <section className="projects">
            <h2>Les programmes disponibles</h2>
  
            <div className="projects__cards">
  
                <div className="projects__card">
                    <h3>Web3 Mastery</h3>
                    <img src={compound} alt="goldenswap Swap Page" />
                    <p>Nous proposons de développer une plateforme de crowdfunding cryptographique  pour soutenir l'innovation 
                        et l'entrepreneuriat en Afrique. Notre objectif est de créer un écosystème transparent, ouvert et inclusif
                        qui permettra aux entrepreneurs, aux créateurs et aux innovateurs africain d’émettre des tokens représentant
                        leurs actifs financiers, tels que des actions, des obligations ou des fonds d'investissement. 
                        Cette plateforme utilise la technologie blockchain pour garantir la sécurité des transactions,
                        la transparence des fonds collectés et la distribution équitable des bénéfices. Ces tokens pourront 
                        ensuite être échangés et négociés de manière transparente sur notre plateforme, offrant ainsi une 
                        alternative moderne et efficace aux méthodes traditionnelles de trading et d'investissement
                    </p>
  
                    <a href="https://stake-easy.com/" target="_blank" className="button">Apply</a>
                    <a href="https://github.com/cryptoniciencom/launchpad" target="_blank" className="button">Lire +</a>
                </div>
  
                <div className="projects__card">
                    <h3> Trading Mastery</h3>
                    <img src={uniswap} alt="Golden crowfunding Page" />
                    <p>
                         Nous développons une plateforme d'incubation et de financement décentralisée basée sur la technologie
                         blockchain pour soutenir les innovateurs digitaux et les entrepreneurs en Afrique. Ce fonds vise à faciliter l'accès 
                         au financement pour les startups prometteuses et à connecter les entrepreneurs aux investisseurs intéressés par leurs
                         projets. Les entreprises pourront être récompensées directement pour leurs innovations, 
                        leurs solutions financières décentralisées et leur contribution à l'évolution de l'industrie financière en afrique."
                    </p>
  
                    <a href="https://stake-easy.com/" target="_blank" className="button">Apply</a>
                    <a href="https://github.com/cryptoniciencom/token-farm" target="_blank" className="button">Lire +</a>
                </div>
  
                <div className="projects__card">
                    <h3>NFT Mastery</h3>
                    <img src={goldenliquidity} alt="Aave Landing Page" />
                    <p>Notre projet vise à créer une plateforme de staking décentralisée basée sur la technologie blockchain,
                        permettant aux détenteurs de tokens de participer au processus de validation des transactions 
                        et de gagner des récompenses en retour. Le staking est une méthode de consensus utilisée par de nombreuses blockchains 
                        qui permet aux utilisateurs de verrouiller leurs cryptomonnaies pour soutenir le réseau et sécuriser les transactions
                    </p>
  
                    <a href="https://stake-easy.com/" target="_blank" className="button">Apply</a>
                    <a href="https://github.com/cryptoniciencom/token-farm" target="_blank" className="button">Lire +</a>
                </div>
                <div className="projects__card">
                    <h3>Webinar Academy</h3>
                    <img src={goldenliquidity} alt="Aave Landing Page" />
                    <p>Notre projet vise à créer une plateforme de staking décentralisée basée sur la technologie blockchain,
                        permettant aux détenteurs de tokens de participer au processus de validation des transactions 
                        et de gagner des récompenses en retour. Le staking est une méthode de consensus utilisée par de nombreuses blockchains 
                        qui permet aux utilisateurs de verrouiller leurs cryptomonnaies pour soutenir le réseau et sécuriser les transactions
                    </p>
  
                    <a href="https://stake-easy.com/" target="_blank" className="button">Apply</a>
                    <a href="https://github.com/cryptoniciencom/token-farm" target="_blank" className="button">Lire +</a>
                </div>
            </div>
            <br/>
            <br/>
        </section>
    );
 }
 
 export default Courses;