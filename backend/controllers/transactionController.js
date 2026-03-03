const Transaction = require('../models/Transaction');

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const { landId, type, limit = 50 } = req.query;
    let query = { initiatedBy: req.user._id };

    if (landId) {
      query.landId = landId;
    }

    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get Transaction History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction history: ' + error.message
    });
  }
};

// Get specific transaction
exports.getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      transactionId,
      initiatedBy: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Get Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction: ' + error.message
    });
  }
};

// Export transaction report
exports.exportReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = { initiatedBy: req.user._id };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 });

    // Format for CSV export
    const csvHeaders = [
      'Transaction ID',
      'Type',
      'Land ID',
      'Details',
      'Status',
      'Date'
    ].join(',') + '\n';

    const csvRows = transactions.map(tx => [
      tx.transactionId,
      tx.type,
      tx.landId,
      `"${tx.details.replace(/"/g, '""')}"`,
      tx.status,
      tx.createdAt.toISOString()
    ].join(',')).join('\n');

    const csvContent = csvHeaders + csvRows;

    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting report: ' + error.message
    });
  }
};