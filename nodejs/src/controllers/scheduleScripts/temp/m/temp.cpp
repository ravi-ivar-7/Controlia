#include <iostream>
using namespace std;

int main(int argc, char *argv[]) {
    if (argc < 4) {
        cerr << "Usage: " << argv[0] << " arg1 arg2 arg3" << endl;
        return 1;
    }

    // Arguments
    string arg1 = argv[1];
    string arg2 = argv[2];
    string arg3 = argv[3];

    // Output arguments
    cout << "Argument 1: " << arg1 << endl;
    cout << "Argument 2: " << arg2 << endl;
    cout << "Argument 3: " << arg3 << endl;

    return 0;
}
