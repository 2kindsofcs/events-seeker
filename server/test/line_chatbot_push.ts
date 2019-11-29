import 'mocha';
import chai from 'chai';
import { eventFilter, updateEventData, getUserIdWithKeywords, pushMessage } from '../line_chatbot_push';
import { Sequelize, Model, DataTypes } from 'sequelize';
import { initEventData } from '../models/eventData';
import { initUser } from '../models/user'
import { initKeywords } from '../models/keywords';
import EventData from '../models/eventData';
import user from '../models/user';
import keywords from '../models/keywords';

describe("eventFilter", () => {
    const sequelize = new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
        storage: ':memory:'
    });
    initEventData(sequelize);
    initUser(sequelize);
    initKeywords(sequelize);
    sequelize.sync();

    it("should return proper dictionary", () => {
    const updatedEvents = [
        EventData.build({
            eventId: 333, eventName: "삼삼삼 이벤트"
        }),
        EventData.build({
            eventId: 123, eventName: "일이삼 이벤트"
        }),
    ];
    const keywordList = ["삼삼", "일이"];
    const result = eventFilter(updatedEvents, keywordList);
    chai.assert.deepEqual(result, {
        "삼삼": ["https://festa.io/events/333"],
        "일이": ["https://festa.io/events/123"]
        })
    });

    it("should updated DB with new event data", async () => {
        const newEventData: [number, string][] = [
            [125, "새 이벤트"],
            [126, "새 이벤트"],
        ];
        await updateEventData(newEventData);
        const data = await EventData.findAll({
            where:{
                eventName: "새 이벤트"
            }
        })
        const result = data.map((instance) => [instance.eventId, instance.eventName])
        chai.assert.deepEqual(result, newEventData);
    })

    it("should be able to get user ids with keywords", async () => {
        await user.create({
            id: 1,
            userId: "abcdef12345",
            isPush: false,
            cycle: ""
        })
        await keywords.create({
            id: 1,
            userId: "abcdef12345",
            keyword: "es6"
        })
        const result = await getUserIdWithKeywords();
        const expectedResult = [["abcdef12345", ["es6"]]];
        chai.assert.deepEqual(result, expectedResult)
    })
    // TODO: pushMessage 테스트 케이스 작성 
})


// node_modules/.bin/mocha -r ts-node/register server/test/**/*.ts