 // Import Assets
import uniswap from '../assets/uniswap.png';
import compound from '../assets/compound.png';
import goldenliquidity from '../assets/goldenliquidity.jpg';
import stakeearn from '../assets/stakeearn.jpg';


export const Projects = () => {
    return (
        <section className="projects">
            <h2>Build with us</h2>

            <div className="projects__cards">

                <div className="projects__card">
                    <h3>easy Starter</h3>
                    <img src={compound} alt="goldenswap Swap Page" />
                    <p>Nous envisageons de créer une plateforme de crowdfunding cryptographique transparent, ouvert et inclusif 
                        permettant aux créateurs et innovateurs africains d’émettre des tokens représentant leurs actifs financiers, 
                       tels que des actions, des obligations ou des fonds d'investissement. Les récompenses sont redistribuée 
                       équitablement aux investisseurs, offrant ainsi une alternative moderne et efficace aux méthodes 
                       traditionnelles de trading et d'investissement.
                    </p>

                    <a href="https://stake-easy.com/" target="_blank" className="button">Site</a>
                    <a href="https://github.com/cryptoniciencom/easy-starter" target="_blank" className="button">Code</a>
                </div>

                <div className="projects__card">
                    <h3>easy Labs</h3>
                    <img src={uniswap} alt="stakeEASY crowfunding Page" />
                    <p>
                        Nous développons une plateforme d'incubation décentralisée pour accélérer l'adoption des fintech en Afrique.
                        Ce fonds vise à faciliter l'accès au financement pour les startups prometteuses et à connecter 
                        les entrepreneurs aux investisseurs intéressés par leurs projets. 
                        Les entreprises pourront être récompensées directement pour leurs innovations, leurs solutions 
                        financières décentralisées et leur contribution à l'évolution de l'industrie financière en afrique.
                    </p>

                    <a href="https://stake-easy.com/" target="_blank" className="button">Site</a>
                    <a href="https://github.com/cryptoniciencom/token-farm" target="_blank" className="button">Code</a>
                </div>

                <div className="projects__card">
                    <h3>stake EASY</h3>
                    <img src={stakeearn} alt="stakeEASY Landing Page" />
                    <p> Protocole de staking décentralisée, permettant aux détenteurs de tokens de participer 
                        au processus de validation des transactions et de gagner des récompenses en retour. 
                        Le staking est une méthode de consensus utilisée par de nombreuses blockchains 
                        qui permet aux utilisateurs de verrouiller leurs cryptomonnaies pour participer 
                        aux fonctionnement du réseau et sécuriser les transactions.
                    </p>

                    <a href="https://stake-easy.com/" target="_blank" className="button">Site</a>
                    <a href="https://github.com/cryptoniciencom/token-farm" target="_blank" className="button">Code</a>
                </div>

                <div className="projects__card">
                    <h3>Golden Token</h3>
                    <img src={goldenliquidity} alt="golden token Landing Page" />
                    <p> Le jeton natif de GoldenBridge (GLD) qui servira à l'éducation, au developpement des cas d'utilisations
                        ainsi que pour la gouvernance du protocole pour une amélioration du climat d'affaire entre utilisateurs.
                        Il favorisera l'émergence des fintechs africaines, start-up fournissant des offres de services
                        financiers, bancaire et d'assurance basées sur des solutions innovantes bousculant les acteurs.
                    </p>

                    <a href="https://stake-easy.com/" target="_blank" className="button">Site</a>
                    <a href="https://github.com/cryptoniciencom/token-farm" target="_blank" className="button">Code</a>
                </div>
            </div>
        </section>
    );
}

export default Projects;