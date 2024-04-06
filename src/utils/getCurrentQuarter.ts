const quarterTable = [
    {
        quarter: 'Q1',
        end: '11/3/23',
        oid: 'GTM0000000C1s8'
    },
    {
        quarter: 'Q2',
        end: '1/19/24',
        oid: 'GTM0000000C1s9'
    },
    {
        quarter: 'Q3',
        end: '4/5/24',
        oid: 'GTM0000000C1sA'
    },
    {
        quarter: 'Q4',
        end: '6/21/24',
        oid: 'GTM0000000C1sB'
    }
]

export function getCurrentQuarterOid() {
    // const today = new Date();
    // for (let i = 0; i < quarterTable.length; i++) {
    //     const quarter = quarterTable[i];
    //     const endDate = new Date(quarter.end);
    //     if (today < endDate) {
    //         return quarter.oid;
    //     }
    // }

    return quarterTable[2].oid;
}