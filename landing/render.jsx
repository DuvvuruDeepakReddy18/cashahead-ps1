import {renderToString} from 'react-dom/server';
import Waterline from './cinema/Waterline.jsx';
export function renderTour(){return renderToString(<Waterline />);}
