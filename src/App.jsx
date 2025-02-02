import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 

 
import Header from "./components/Header"
import ProductDisplay from "./components/ProductDisplay";
import CategoriesList from "./components/Categorychange";
import Latest from "./components/Latest";
import Items from "./components/categori";
import Cart from "./components/Cart"
import ScrollToTop from "./components/ScrollToTop";
import Port from "./components/port"
function App() {
  
  return (<Router>
   <>
   <ScrollToTop/>
   <Port/>
    {/* <Header/> */}


    {/* <CategoriesList/> */}
   {/* <hr className="max-w-3/4 bg-gray-600"/>  horizontal rule to separate components */}
    {/* <Routes> */}
    {/* <Route path="/:title" element={<Items />} /> */}
    {/* <Route path="/cart" element={<Cart />} /> */}
    {/* <Route path="/pd/:id" element={<ProductDisplay />} /> */}
    {/* <Route path ="/latest" element ={<Latest/>}/> */}
    {/* </Routes> */}
    {/* <Latest/> */}
    
    
    </>
    </Router>
  
  )
}

export default App;
