'use strict';

import { Sequelize, Options } from 'sequelize';
import { initEventData } from "./eventData";
import { initKeywords } from "./keywords";
import { initUser } from "./user";

export function init(config: Options) {
    const sequelize = new Sequelize({
        dialectOptions: {
            charset: 'utf8mb4'
        },
        ...config,
    });

    initEventData(sequelize);
    initKeywords(sequelize);
    initUser(sequelize);
    
    sequelize.sync();
}
