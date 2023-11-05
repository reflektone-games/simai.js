import { Tokenizer } from "./internal/lexicalAnalysis/tokenizer";
import { Deserializer } from "./internal/syntacticAnalysis/deserializer";
import { MaiChart } from "./structures/maiChart";

export class SimaiConvert {
    public static deserialize(data: string): MaiChart {
        const tokens = new Tokenizer(data).getTokens();
        const chart = new Deserializer(tokens).getChart();

        return chart;
    }
}
