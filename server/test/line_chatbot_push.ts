import 'mocha';
import chai from 'chai';
import { eventFilter } from '../line_chatbot_push';
import EventData from '../models/eventData';

describe("eventFilter", () => {
    it("should return proper dictionary", () => {
        const updatedEvents = [
            EventData.build({
                eventId: 333, eventName: "삼삼삼 이벤트"
            }),
            EventData.build({
                eventId: 123, eventName: "일이삼 이벤트"
            })];
        const keywordList = ["삼삼", "일이"];
        const result = eventFilter(updatedEvents, keywordList);
        chai.assert.deepEqual(result, {
            "삼삼": ["https://festa.io/events/333"],
            "일이": ["https://festa.io/events/123"]
        })
    })
})