#include "core/AdhkarService.h"
#include "core/PathService.h"

#include <QCoreApplication>
#include <QTextStream>

namespace {
void printUsage(QTextStream &out) {
  out << "Usage:\n"
      << "  adhkarctl paths\n"
      << "  adhkarctl categories\n"
      << "  adhkarctl search <query>\n"
      << "  adhkarctl show <category-slug>\n"
      << "  adhkarctl favorites\n"
      << "  adhkarctl favorite <row-id>\n"
      << "  adhkarctl unfavorite <row-id>\n"
      << "  adhkarctl history\n"
      << "  adhkarctl clear-history\n";
}

QString rowTitle(const QVariantMap &row) {
  const QVariantMap category = row.value(QStringLiteral("category")).toMap();
  const QVariantMap item = row.value(QStringLiteral("item")).toMap();
  const QString title = item.value(QStringLiteral("title")).toString();
  return title.isEmpty() ? category.value(QStringLiteral("name")).toString()
                         : title;
}
} // namespace

int main(int argc, char *argv[]) {
  QCoreApplication app(argc, argv);
  QTextStream out(stdout);
  QTextStream err(stderr);

  AdhkarService adhkar;
  if (!adhkar.load()) {
    err << adhkar.errorString() << '\n';
    return 1;
  }

  const QStringList args = app.arguments().mid(1);
  if (args.isEmpty() || args.first() == QStringLiteral("help") ||
      args.first() == QStringLiteral("--help")) {
    printUsage(out);
    return args.isEmpty() ? 1 : 0;
  }

  const QString command = args.first();
  if (command == QStringLiteral("paths")) {
    out << "Config: " << PathService::configFilePath() << '\n'
        << "Database: " << PathService::databasePath() << '\n'
        << "Cache: " << PathService::cacheDir() << '\n';
    return 0;
  }

  if (command == QStringLiteral("categories")) {
    for (const QVariant &categoryValue : adhkar.categories()) {
      const QVariantMap category = categoryValue.toMap();
      out << category.value(QStringLiteral("slug")).toString() << '\t'
          << category.value(QStringLiteral("name")).toString() << '\t'
          << category.value(QStringLiteral("name_ar")).toString() << '\n';
    }
    return 0;
  }

  if (command == QStringLiteral("search")) {
    const QString query = args.mid(1).join(QLatin1Char(' '));
    if (query.trimmed().isEmpty()) {
      err << "search requires a query\n";
      return 1;
    }
    for (const QVariant &rowValue : adhkar.searchRows(query)) {
      const QVariantMap row = rowValue.toMap();
      const QVariantMap category =
          row.value(QStringLiteral("category")).toMap();
      out << category.value(QStringLiteral("slug")).toString() << ':'
          << row.value(QStringLiteral("index")).toInt() + 1 << '\t'
          << rowTitle(row) << '\n';
    }
    return 0;
  }

  if (command == QStringLiteral("show")) {
    if (args.size() < 2) {
      err << "show requires a category slug\n";
      return 1;
    }
    const QVariantList rows = adhkar.rowsForCategory(args.at(1));
    if (rows.isEmpty()) {
      err << "No category found for slug: " << args.at(1) << '\n';
      return 1;
    }
    for (const QVariant &rowValue : rows) {
      const QVariantMap row = rowValue.toMap();
      const QVariantMap item = row.value(QStringLiteral("item")).toMap();
      out << row.value(QStringLiteral("index")).toInt() + 1 << ". "
          << rowTitle(row) << '\n'
          << item.value(QStringLiteral("arabic")).toString() << "\n\n";
    }
    return 0;
  }

  if (command == QStringLiteral("favorites")) {
    for (const QVariant &rowValue : adhkar.favoriteRows()) {
      const QVariantMap row = rowValue.toMap();
      out << row.value(QStringLiteral("id")).toString() << '\t' << rowTitle(row)
          << '\n';
    }
    return 0;
  }

  if (command == QStringLiteral("favorite") ||
      command == QStringLiteral("unfavorite")) {
    if (args.size() < 2) {
      err << command << " requires a row id, e.g. morning-0\n";
      return 1;
    }
    if (!adhkar.setFavorite(args.at(1),
                            command == QStringLiteral("favorite"))) {
      err << "Failed to update favorite\n";
      return 1;
    }
    return 0;
  }

  if (command == QStringLiteral("history")) {
    for (const QVariant &rowValue : adhkar.historyRows()) {
      const QVariantMap row = rowValue.toMap();
      out << row.value(QStringLiteral("shownAt")).toString() << '\t'
          << row.value(QStringLiteral("rowId")).toString() << '\t'
          << row.value(QStringLiteral("title")).toString() << '\n';
    }
    return 0;
  }

  if (command == QStringLiteral("clear-history")) {
    if (!adhkar.clearHistory()) {
      err << "Failed to clear history\n";
      return 1;
    }
    return 0;
  }

  err << "Unknown command: " << command << "\n\n";
  printUsage(err);
  return 1;
}
