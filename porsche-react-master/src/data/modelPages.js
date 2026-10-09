// slug -> page components. Only the router imports this file (see models.js for why).
import GT3RS_3D from '../pages/GT3RS_3D';
import Taycan_3D from '../pages/Taycan_3D';
import Cayenne_3D from '../pages/Cayenne_3D';
import Turbo_3D from '../pages/Turbo_3D';
import Spyder_918_3D from '../pages/Spyder_918_3D';
import GT2RS_911 from '../pages/models/GT2RS_911';
import CarreraGT from '../pages/models/CarreraGT';
import Cayman_GT4RS from '../pages/models/Cayman_GT4RS';
import CaymanBoxster from '../pages/models/CaymanBoxster';
import Macan from '../pages/models/Macan';
import Panamera from '../pages/models/Panamera';
import GT3RS from '../pages/models/GT3RS';
import Spyder_918 from '../pages/models/Spyder_918';
import Cayenne from '../pages/models/Cayenne';
import Taycan from '../pages/models/Taycan';
import TurboS_911 from '../pages/models/TurboS_911';

// Page = what /models/<slug> shows (the 3D showroom where one exists, exactly as before).
// Details = the classic page linked from each 3D showroom's call-to-action.
export const MODEL_PAGES = {
    '911-gt3-rs': { Page: GT3RS_3D, Details: GT3RS },
    '911-turbo-s': { Page: Turbo_3D, Details: TurboS_911 },
    '918-spyder': { Page: Spyder_918_3D, Details: Spyder_918 },
    cayenne: { Page: Cayenne_3D, Details: Cayenne },
    taycan: { Page: Taycan_3D, Details: Taycan },
    '911-gt2-rs': { Page: GT2RS_911 },
    'carrera-gt': { Page: CarreraGT },
    '718-cayman-gt4-rs': { Page: Cayman_GT4RS },
    '718-boxster-s': { Page: CaymanBoxster },
    'macan-gts': { Page: Macan },
    panamera: { Page: Panamera },
};
