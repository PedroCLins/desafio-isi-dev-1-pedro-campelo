import type { ConditionEnumType } from "../DTOs";


export default new class BusinessRules {
    // RN01
    private physicalConditionDiscount(condition: ConditionEnumType) {
        const discountMap: Record<ConditionEnumType, number> = {
            "APTO": 0,
            "MAL_CONDICIONADO": 0.15,
            "DOENTE": 0.3,
        };

        return discountMap[condition] || 0;
    }

    // RN03
    private agilityDiscount(agility: number, discount: number) {
        if (agility >= 80) {
            return discount * 0.5; // Discount gets halved for agility 80 or above
        } else if (agility <= 30) {
            return discount + 0.1; // 10% absolute increase in discount for agility 30 or below
        }
        return discount; // No change for agility between 31 and 79
    }

    // RN04
    private ageDiscountAdjustment(age: number) {
        if (age <= 21) {
            return -0.1; // 10% absolute decrease in discount for age 21 or below (young promising players)
        } else if (age >= 32) {
            return 0.1; // 10% absolute increase in discount for age 32 or above (older players)
        }
        return 0; // No change for age between 22 and 31
    }

    // RN05
    public getMarketValue(condition: ConditionEnumType, agility: number, age: number, baseValue: string): string {
        let discount = this.physicalConditionDiscount(condition);
        if (condition !== "APTO") {
            discount = this.agilityDiscount(agility, discount);
        }
        discount += this.ageDiscountAdjustment(age);
        discount = Math.min(0.4, discount); // Ensure discount does not exceed 40%

        const marketValue = parseFloat(baseValue) * (1 - discount);
        const formattedMarketValue = Math.max(1, marketValue).toFixed(2); // Ensure market value does not go below 1, and round to 2 decimal places

        return formattedMarketValue;
    }

    public getNumericMarketValue(condition: ConditionEnumType, agility: number, age: number, baseValue: string): number {
        const numericMarketValue = parseFloat(this.getMarketValue(condition, agility, age, baseValue));
        return numericMarketValue;
    }
}