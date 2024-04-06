#include <iostream>
#include <string>

#include "misc.cpp"

#define pass void(0)

class ReadWriteJson
{
    void read_json(std::string json_string)
    {
        pass;
    }
    std::string write_json()
    {
        pass;
    }
};

int main(int argc, char *argv[])
{
    if (argc != 3)
    {
        err("One arg only should be given (should be a long string in json string format)");
    }

    // Print the result
    std::cout << "State: " << std::endl;
    std::cout << argv[1] << std::endl;
    std::cout << std::endl;
    std::cout << "Command: " << std::endl;
    std::cout << argv[2] << std::endl;

    return 0;
}