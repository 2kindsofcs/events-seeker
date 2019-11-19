'use strict';

import { Sequelize } from 'sequelize';
import config from 'config';

export const sequelize = new Sequelize({
    dialectOptions: {
        charset: 'utf8mb4'
    },
    ...config.get('db'),
});
export default sequelize;
