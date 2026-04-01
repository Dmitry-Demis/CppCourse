#include <iostream>

namespace game {namespace physics {float gravity{9.81f};

        float fallDistance(float time) {return 0.5f * gravity * time * time;}}

    namespace render {void drawFrame(int frame) {std::cout << "Рендер кадра #" << frame << '\n';}}}

// C++17: вложенные пространства имён через ::
namespace game::audio {void playSound(const char* name) {std::cout << "Звук: " << name << '\n';}}

int main() {std::cout << game::physics::fallDistance(2.0f) << " м\n";  // 19.62 м
    game::render::drawFrame(1);
    game::audio::playSound("jump.wav");
    return 0;}

