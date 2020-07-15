// Webpack bootstrap files.

import './asset/favicon.png'; // <- should be same as workspace.config
import './asset/style/base.scss';

// Your main script.
import combustible from './asset/script/main';

const Bon = new combustible();
Bon.fire();