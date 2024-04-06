#include <iostream>
#include <string>

void err(std::string s)
{
    std::cout << "Error: " << s << std::endl;
    exit(1);
}