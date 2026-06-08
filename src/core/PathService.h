#pragma once

#include <QString>

class PathService {
public:
    static QString configDir();
    static QString dataDir();
    static QString cacheDir();
    static QString configFilePath();
    static QString databasePath();
};
