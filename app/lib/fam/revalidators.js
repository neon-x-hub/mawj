import datarows from "../providers/datarows";

const revalidators = {
    columns: async (_, revalidationProps) => {
        const dbProvider = await datarows.getDataProvider();
        const allRows = await dbProvider.find(revalidationProps.projectId);


        const columnCounts = {};
        allRows.forEach(doc => {
            Object.keys(doc.data || {}).forEach(key => {
                columnCounts[key] = (columnCounts[key] || 0) + 1;
            });
        });


        return Object.entries(columnCounts).map(([n, c]) => ({ n, c }));
    },

    rowCount: async (_, revalidationProps) => {
        const dbProvider = await datarows.getDataProvider();
        const allRows = await dbProvider.find(revalidationProps.projectId);
        return allRows.length;
    },

    doneCount: async (_, revalidationProps) => {
        const dbProvider = await datarows.getDataProvider();
        const allRows = await dbProvider.find(
            revalidationProps.projectId,
            { "m.status": true }
        );
        return allRows.length;
    },
};

export default revalidators;
