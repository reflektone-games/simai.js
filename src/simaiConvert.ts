import { Deserializer } from "./internal/syntacticAnalysis/deserializer";
import { Serializer } from "./internal/syntacticAnalysis/serializer";
import { Tokenizer } from "./internal/lexicalAnalysis/tokenizer";
import { MaiChart } from "./structures/maiChart";

export class SimaiConvert {
    public static deserialize(data: string): MaiChart {
        const tokens = new Tokenizer(data).getTokens();
        const chart = new Deserializer(tokens).getChart();
        return chart;
    }

    public static serialize(chart: MaiChart): string {
        const serializer = new Serializer();
        return serializer.serialize(chart);
    }
}
