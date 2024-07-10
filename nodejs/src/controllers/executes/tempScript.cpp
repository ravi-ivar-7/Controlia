#include <iostream>

int main(int argc, char *argv[]) {
    std::cout << "Number of arguments: " << argc - 1 << std::endl;
    for (int i = 1; i < argc; ++i) {
        std::cout << "Argument " << i << ": " << argv[i] << std::endl;
    }
    return 0;
}
