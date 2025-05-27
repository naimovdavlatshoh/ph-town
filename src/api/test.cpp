#include <iostream>

class Image
{
public:
    void GetImageInfo()
    {
        for (size_t i = 0; i < 5; i++)
        {
            std::cout << pixels[i].GetInfo() << std::endl;
        }
    }

private:
    class Pixel
    {
    public:
        Pixel(int r, int g, int b)
        {
            this->r = r;
            this->g = g;
            this->b = b;
        }

        std::string GetInfo()
        {
            return "Pixels: r = " + std::to_string(r);
        }

    private:
        int r;
        int g;
        int b;
    };

    Pixel pixels[5] = {
        Pixel(1, 5, 6),
        Pixel(5, 3, 242),
        Pixel(6, 23, 24),
        Pixel(122, 5, 254),
        Pixel(1, 233, 52),
    };
};

int main()
{

    Image image;
    image.GetImageInfo();
    std::cout << "wadwad" << std::endl;

    return 0;
}
