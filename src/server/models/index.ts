'use strict';

import { Sequelize } from 'sequelize';
import config from 'config';

export const sequelize = new Sequelize(config.get('db'));
export default sequelize;
