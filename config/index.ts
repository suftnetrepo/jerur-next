const HOST = process.env.NEXT_PUBLIC_BASE_URL || "https://jerur-next.onrender.com/api/";

const VERBS = {
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT'
};

export { VERBS, HOST };
