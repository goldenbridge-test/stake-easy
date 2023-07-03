import React from 'react';
import Search from './Search'
 
 export const MyComponent = () => {
    return(
        <div>
          <h1>Hello ! Aucune historique de cours !
          </h1>
          <p>Veuillez vous rendre sur la page d'acceuille pour vous inscrire au programme de votre choix.</p>
          <hr/>
          <br/>
          <div>
            <Search></Search>
          </div>
          <br/>
          <div>
          <a href="./CreatePlan.js" className="button"> <h1>Créer un plan</h1></a>
          </div>
        </div>
    );
 }
 
 export default MyComponent;