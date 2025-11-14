// Query builder utility for filtering, sorting, and pagination

export class QueryBuilder {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Filter by fields
    filter() {
        const queryObj = { ...this.queryString };
        
        // Exclude fields that are not for filtering
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Advanced filtering (gte, gt, lte, lt)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // Sort results
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Default sort by createdAt descending
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    // Limit fields
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // Exclude __v by default
            this.query = this.query.select('-__v');
        }
        return this;
    }

    // Paginate results
    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = parseInt(this.queryString.limit, 10) || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    // Search in multiple fields
    search(fields = []) {
        if (this.queryString.search && fields.length > 0) {
            const searchQuery = {
                $or: fields.map(field => ({
                    [field]: { $regex: this.queryString.search, $options: 'i' }
                }))
            };
            this.query = this.query.find(searchQuery);
        }
        return this;
    }

    // Filter by date range
    dateRange(field = 'createdAt') {
        const { startDate, endDate } = this.queryString;
        
        if (startDate || endDate) {
            const dateFilter = {};
            
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            
            if (endDate) {
                dateFilter.$lte = new Date(endDate);
            }
            
            this.query = this.query.find({ [field]: dateFilter });
        }
        
        return this;
    }

    // Filter by array field (e.g., skills, branches)
    arrayFilter(field) {
        if (this.queryString[field]) {
            const values = this.queryString[field].split(',');
            this.query = this.query.find({ [field]: { $in: values } });
        }
        return this;
    }

    // Filter by range (e.g., CGPA, salary)
    rangeFilter(field, minParam, maxParam) {
        const min = this.queryString[minParam];
        const max = this.queryString[maxParam];
        
        if (min || max) {
            const rangeFilter = {};
            
            if (min) {
                rangeFilter.$gte = parseFloat(min);
            }
            
            if (max) {
                rangeFilter.$lte = parseFloat(max);
            }
            
            this.query = this.query.find({ [field]: rangeFilter });
        }
        
        return this;
    }

    // Populate related documents
    populate(fields) {
        if (fields) {
            if (Array.isArray(fields)) {
                fields.forEach(field => {
                    this.query = this.query.populate(field);
                });
            } else {
                this.query = this.query.populate(fields);
            }
        }
        return this;
    }

    // Filter by boolean field
    booleanFilter(field) {
        if (this.queryString[field] !== undefined) {
            const value = this.queryString[field] === 'true';
            this.query = this.query.find({ [field]: value });
        }
        return this;
    }

    // Execute query
    async execute() {
        return await this.query;
    }

    // Get count for pagination
    async count() {
        const countQuery = this.query.model.find(this.query.getFilter());
        return await countQuery.countDocuments();
    }
}

// Helper function to build query
export const buildQuery = (model, queryString) => {
    return new QueryBuilder(model.find(), queryString);
};

// Pagination helper
export const getPaginationData = (page, limit, total) => {
    return {
        currentPage: parseInt(page, 10) || 1,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit, 10) || 10,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
    };
};

// Filter builder for common queries
export const buildCommonFilters = (queryString) => {
    const filters = {};

    // Active status
    if (queryString.isActive !== undefined) {
        filters.isActive = queryString.isActive === 'true';
    }

    // Verification status
    if (queryString.isVerified !== undefined) {
        filters.isVerified = queryString.isVerified === 'true';
    }

    // Status field
    if (queryString.status) {
        filters.status = queryString.status;
    }

    // Branch filter
    if (queryString.branch) {
        filters.branch = { $in: queryString.branch.split(',') };
    }

    // Batch filter
    if (queryString.batch) {
        filters.batch = { $in: queryString.batch.split(',') };
    }

    // CGPA range
    if (queryString.minCgpa || queryString.maxCgpa) {
        filters.cgpa = {};
        if (queryString.minCgpa) filters.cgpa.$gte = parseFloat(queryString.minCgpa);
        if (queryString.maxCgpa) filters.cgpa.$lte = parseFloat(queryString.maxCgpa);
    }

    // Date range for createdAt
    if (queryString.startDate || queryString.endDate) {
        filters.createdAt = {};
        if (queryString.startDate) filters.createdAt.$gte = new Date(queryString.startDate);
        if (queryString.endDate) filters.createdAt.$lte = new Date(queryString.endDate);
    }

    return filters;
};

// Sort builder
export const buildSort = (sortString, defaultSort = '-createdAt') => {
    if (!sortString) return defaultSort;
    return sortString.split(',').join(' ');
};

// Search builder for text search
export const buildTextSearch = (searchTerm, fields = []) => {
    if (!searchTerm || fields.length === 0) return {};
    
    return {
        $or: fields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
        }))
    };
};

export default {
    QueryBuilder,
    buildQuery,
    getPaginationData,
    buildCommonFilters,
    buildSort,
    buildTextSearch,
};
