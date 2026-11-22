import {createRoot,hydrateRoot} from 'react-dom/client';
import Waterline from './cinema/Waterline.jsx';

const host=document.getElementById('app');
if(host.querySelector('#studio-opening'))hydrateRoot(host,<Waterline />);
else createRoot(host).render(<Waterline />);
