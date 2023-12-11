const Joi = require('joi');

const validatePage = (page) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).required(),
  });

  const { error, value } = schema.validate({ page });

  if (error) {
    throw new Error(`Invalid page value: ${error.message}`);
  }

  return value.page;
};

const paginateResults = (results, page, pageSize) => {
  // Validasi nilai halaman
  const currentPage = validatePage(page);

  // Hitung total halaman
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / pageSize);

  // Ambil hasil untuk halaman tertentu
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    status: 'Success',
    jobs: paginatedResults.map((job) => ({ ...job._doc, distance: job.distance })),
    currentPage,
    totalPages,
  };
};

module.exports = { paginateResults, validatePage };
