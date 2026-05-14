
class ApiResponse {

  static success(data, message = "OK") {

    return {
      success: true,
      message,
      data
    };
  }

  static error(message = "Error", errors = null) {

    return {
      success: false,
      message,
      errors
    };
  }
}

module.exports = ApiResponse;