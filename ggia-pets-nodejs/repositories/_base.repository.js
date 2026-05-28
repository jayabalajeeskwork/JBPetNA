module.exports = class BaseRepository {
    constructor() {
        this._session = null
    }

    setDBSession(session) {
        this._session = session;
    }

    /**
     * Get model - To be implemented by child classes
     */
    getModel() {
        throw new Error('getModel() must be implemented by child repository');
    }

    async find(query, select = null, populate = null, sort = { createdAt: -1 }, limit = null) {
        let q = this.getModel().find(query).select(select).populate(populate).sort(sort);
        if (limit) q = q.limit(limit);
        return q.session(this._session);
    }

    async findById(id, select = null, populate = null) {
        return this.getModel().findById(id).select(select).populate(populate).session(this._session);
    }

    async findOne(query, select = null, populate = null) {
        return this.getModel().findOne(query).select(select).populate(populate).session(this._session);
    }

    async create(data) {
        const model = this.getModel();
        const doc = new model(data);
        return doc.save({ session: this._session });
    }

    async updateById(id, data, options = { new: true }) {
        return this.getModel().findByIdAndUpdate(id, data, options).session(this._session);
    }

    async updateOne(query, data, options = { new: true }) {
        return this.getModel().findOneAndUpdate(query, data, options).session(this._session);
    }

    async deleteById(id) {
        return this.getModel().findByIdAndDelete(id).session(this._session);
    }

    async save(doc) {
        return doc.save({ session: this._session });
    }

    /**
     * Check if lookup operations affect count
     */
    checkCountEffectKeys = (pipeline) => {
        const countAffectingKeys = ['$match', '$unwind', '$group', '$skip', '$limit', '$facet', '$sortByCount'];
        const keysFound = [];

        for (const stage of pipeline) {
            const stageKey = Object.keys(stage)[0];
            if (countAffectingKeys.includes(stageKey)) {
                keysFound.push(stageKey);
            }
        }

        return keysFound.length > 0 ? keysFound : null;
    }

    paginate = async ({
        model,
        sort = { field: 'createdAt', order: -1 },
        aggregation = [],
        pageNumber = 1,
        pageSize = 20,
        filters = [],
        project = null,
        addFields = null,
        lookup = [],
        multipleSort = [],
    }) => {
        const targetModel = model || this.getModel();
        try {
            // Handle filters with match property
            if (filters.hasOwnProperty('match')) {
                aggregation.unshift({
                    $match: filters['match']
                })
            }

            // Handle geonear filters
            if (filters.hasOwnProperty('geonear')) {
                aggregation.unshift({
                    $geoNear: filters['geonear']
                })
            }

            let countEffectKeys = null;

            if (lookup.length > 0) {
                countEffectKeys = this.checkCountEffectKeys(lookup);
            }

            if (countEffectKeys) {
                if (lookup.length > 0) {
                    aggregation.push(...lookup)
                }
            }

            const countPipeline = [...aggregation, { $count: 'totalDocuments' }];
            const countResult = await targetModel.aggregate(countPipeline).session(this._session);

            if (!countEffectKeys) {
                if (lookup.length > 0) {
                    aggregation.push(...lookup)
                }
            }

            if (addFields) {
                aggregation.push({
                    $addFields: addFields
                })
            }

            if (project) {
                aggregation.push({
                    $project: project
                })
            }

            const totalDocuments = countResult.length > 0 ? countResult[0].totalDocuments : 0;
            const totalPages = Math.ceil(totalDocuments / pageSize);
            if (pageNumber < 1) {
                throw new Error('Invalid page number');
            }

            let sortObject = {};

            if (multipleSort.length > 0) {
                sortObject = multipleSort.reduce((acc, { field, order }) => {
                    acc[field] = order;
                    return acc;
                }, {});
            }
            else {
                sortObject = { [sort.field]: sort.order };
            }

            const pipeline = [
                ...aggregation,
                { $sort: sortObject },
                { $skip: (pageNumber - 1) * pageSize },
                { $limit: pageSize }
            ];
            const documents = await targetModel.aggregate(pipeline).session(this._session);

            return {
                pageNumber,
                pageSize,
                totalPages,
                totalDocuments,
                documents
            };
        } catch (error) {
            throw new Error(`Pagination failed: ${error.message}`);
        }
    };
}
