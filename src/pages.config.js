/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Home from './pages/Home';
import LocalNews from './pages/LocalNews';
import WorldNews from './pages/WorldNews';
import FootballNews from './pages/FootballNews';
import LiveScores from './pages/LiveScores';
import MarketplaceCars from './pages/MarketplaceCars';
import MarketplaceHouses from './pages/MarketplaceHouses';
import MarketplaceLand from './pages/MarketplaceLand';
import ListingDetail from './pages/ListingDetail';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import __Layout from './Layout.jsx';


export const PAGES = {
  "Home": Home,
  "LocalNews": LocalNews,
  "WorldNews": WorldNews,
  "FootballNews": FootballNews,
  "LiveScores": LiveScores,
  "MarketplaceCars": MarketplaceCars,
  "MarketplaceHouses": MarketplaceHouses,
  "MarketplaceLand": MarketplaceLand,
  "ListingDetail": ListingDetail,
  "Dashboard": Dashboard,
  "AdminPanel": AdminPanel,
}

export const pagesConfig = {
  mainPage: "Home",
  Pages: PAGES,
  Layout: __Layout,
};