const qs = require('qs');
const AppError = require('./appError');

class APIFeatire {
  constructor(query, req) {
    this.query = query;
    this.req = req;
  }

  filter() {
    console.log(this.req.query);
    let queryObj;
    //console.log('dddddddd',this.req.query);
    if (this.req.usealias) {
      //console.log('dddddddd',this.req.aliasQuery);
      queryObj = { ...this.req.aliasQuery };
      //console.log('dddddddd',queryObj);
    } else {
      queryObj = { ...this.req.query };
    }
    const excludedFields = ['limit', 'page', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //console.log(req.query,queryObj);

    //ADVANCE FILLTIRING
    //console.log(qs.parse(req.query));
    let queryStr = JSON.stringify(queryObj);
    console.log('queryStr', queryStr);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log('queryStr', qs.parse(JSON.parse(queryStr)));
    this.query = this.query.find(qs.parse(JSON.parse(queryStr)));
    return this;
  }

  sort() {
    //SORTING
    let sortBy;
    if (this.req.usealias) {
      sortBy = this.req.aliasQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //console.log('dddddddddddddd',sortBy)
    } else if (this.req.query.sort) {
      sortBy = this.req.query.sort.split(',').join(' ');
      //console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    let fields;
    if (this.req.usealias) {
      fields = this.req.aliasQuery.fields.split(',').join(' ');
      //console.log(fields);
      this.query.select(fields);
    } else if (this.req.query.fields) {
      fields = this.req.query.fields.split(',').join(' ');
      //console.log(fields);
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    if (this.req.usealias) {
      this.query = this.query.limit(Number(this.req.aliasQuery.limit));
    } else if (this.req.query.page) {
      const page = this.req.query.page * 1 || 1;
      const limit = this.req.query.limit * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      // const docmCount = await Tour.countDocuments();
      // if (skip >= docmCount)
      //     throw new Error("this page doesn't exist ");
    }
    return this;
  }
}

module.exports = APIFeatire;
