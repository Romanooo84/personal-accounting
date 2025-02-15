import { Link } from "react-router-dom"

const Home=()=>{
    return(
        <div>
            <Link to={'analizafaktur'}>Przeslij fakutrę przelewową</Link>
            <Link to={'dodajfakture'}>Przeslij fakutrę gotówkową</Link>
        </div>
    )
}

export default Home